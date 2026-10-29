import { useCallback, useEffect, useReducer, useRef } from 'react';
import { streamSummary } from '../lib/sse.js';
import { ApiError } from '../lib/api.js';
import { STAGES } from '../lib/constants.js';

const fresh = () => ({
  status: 'idle', // idle | running | done | error
  stages: STAGES.map((s) => ({ ...s, state: 'pending' })),
  text: '',
  repository: null,
  kind: null,
  summary: null,
  cached: false,
  error: null,
});

function reducer(state, a) {
  switch (a.type) {
    case 'start':
      return { ...fresh(), status: 'running' };
    case 'stage': {
      if (a.key === 'cache') {
        return { ...state, cached: true, stages: state.stages.map((s) => ({ ...s, state: 'done' })) };
      }
      const idx = state.stages.findIndex((s) => s.key === a.key);
      return {
        ...state,
        stages: state.stages.map((s, i) => (i < idx ? { ...s, state: 'done' } : i === idx ? { ...s, state: 'active' } : s)),
      };
    }
    case 'meta':
      return { ...state, repository: a.repository, kind: a.kind };
    case 'delta':
      return { ...state, text: state.text + a.text };
    case 'done':
      return {
        ...state,
        status: 'done',
        summary: a.summary,
        text: a.summary.contentMd,
        cached: a.cached,
        stages: state.stages.map((s) => ({ ...s, state: 'done' })),
      };
    case 'error':
      return { ...state, status: 'error', error: a.error };
    default:
      return state;
  }
}

export function useAnalyze() {
  const [state, dispatch] = useReducer(reducer, undefined, fresh);
  const controllerRef = useRef(null);
  const bufferRef = useRef('');
  const rafRef = useRef(null);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    bufferRef.current = '';
  }, []);

  const start = useCallback(async (params) => {
    cancel();
    const controller = new AbortController();
    controllerRef.current = controller;
    let finished = false;
    dispatch({ type: 'start' });

    const flush = () => {
      rafRef.current = null;
      if (bufferRef.current) {
        dispatch({ type: 'delta', text: bufferRef.current });
        bufferRef.current = '';
      }
    };

    try {
      await streamSummary(params, {
        signal: controller.signal,
        onEvent: (event, data) => {
          if (event === 'delta') {
            bufferRef.current += data.text;
            rafRef.current ??= requestAnimationFrame(flush); // batch many tiny deltas into one render per frame
            return;
          }
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            flush();
          }
          if (event === 'stage') dispatch({ type: 'stage', key: data.key });
          else if (event === 'meta') dispatch({ type: 'meta', repository: data.repository, kind: data.kind });
          else if (event === 'done') { finished = true; dispatch({ type: 'done', summary: data.summary, cached: data.cached }); }
          else if (event === 'error') { finished = true; dispatch({ type: 'error', error: data }); }
        },
      });
      if (!finished && !controller.signal.aborted) {
        dispatch({ type: 'error', error: { code: 'STREAM_ENDED', message: 'The connection closed before the summary finished. Try again.' } });
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      dispatch({
        type: 'error',
        error: err instanceof ApiError
          ? { code: err.code, message: err.message, details: err.details }
          : { code: 'NETWORK', message: 'We lost the connection. Check your internet and try again.' },
      });
    }
  }, [cancel]);

  useEffect(() => cancel, [cancel]);

  return { state, start, cancel };
}


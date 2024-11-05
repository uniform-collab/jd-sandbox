import { useState } from 'react';
import { FooterPlaceholder } from '../canvas/_navigation/Footer';
import { HeaderPlaceholder } from '../canvas/_navigation/Header';
import Button from '../components/Button';

enum ResetState {
  NotStarted = 'no-started',
  InProgress = 'in-progress',
  Done = 'done',
  Error = 'error',
}

const ResetCanvasCache = () => {
  const [resetState, setResetState] = useState(ResetState.NotStarted);

  const onResetClick = () => {
    setResetState(ResetState.InProgress);
    fetch('/api/reset')
      .then(res => setResetState(res?.ok ? ResetState.Done : ResetState.Error))
      .catch(() => setResetState(ResetState.Error));
  };

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col relative justify-between">
      <HeaderPlaceholder hideLinks />

      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col flex-1 [&>*]:my-auto">
          <h1 className="flex-1 flex justify-center items-center">
            Do you want to reset your canvas configuration to default state?
          </h1>
          <h3 className="flex-1 flex justify-center items-center">
            (You will lose all the changes you made on your canvas)
          </h3>
        </div>

        {resetState === ResetState.NotStarted && (
          <Button className="mt-4" copy="Reset" style="secondary" onClick={onResetClick} />
        )}

        {resetState === ResetState.InProgress && (
          <div
            className="inline-block mt-4 h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"></span>
          </div>
        )}

        {resetState === ResetState.Done && (
          <div className="text-center mt-4 text-green-500">
            Reset canvas configuration has been started successfully. It can take approximately 5-10 minutes.
          </div>
        )}

        {resetState === ResetState.Error && (
          <div className="text-center mt-4 text-error-500">
            Reset canvas configuration has not been started. Please try again
          </div>
        )}
      </div>
      <FooterPlaceholder />
    </div>
  );
};

export default ResetCanvasCache;

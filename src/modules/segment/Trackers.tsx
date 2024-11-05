import { FC } from 'react';

export type TrackersProps = {
  trackersName: string;
  trackers?: [string, number | string | boolean][];
};

const Trackers: FC<TrackersProps> = ({ trackersName, trackers = [] }) => (
  <div className="flex flex-row flex-wrap gap-2 pt-2">
    {trackers.length ? (
      trackers.map(([key, value]) => <TrackerItem key={key} name={key} value={String(value)} />)
    ) : (
      <span className="text-gray-500 my-3">{`No ${trackersName} for this profile`}</span>
    )}
  </div>
);

type TrackerItemProps = {
  name: string;
  value: string;
};

const TrackerItem: FC<TrackerItemProps> = ({ name = 'unknown', value = 'undefined' }) => (
  <div className="flex flex-row gap-1 rounded-3xl px-6 py-3 bg-gray-200">
    <span className="capitalize">{name}</span>:<span>{value}</span>
  </div>
);

export default Trackers;

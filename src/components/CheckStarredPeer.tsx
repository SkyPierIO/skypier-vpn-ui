import React from 'react';
import StarAPeer from './StarAPeer';
import UnstarAPeer from './UnstarAPeer';

interface CheckStarredPeerProps {
  peerId: string;
}

const CheckStarredPeer: React.FC<CheckStarredPeerProps> = ({ peerId }) => {
  const isPeerStarred = (): boolean => {
    const starredPeers = getStarredPeers();
    return starredPeers.includes(peerId);
  };

  const getStarredPeers = (): string[] => {
    const storedPeers = localStorage.getItem('starredPeers');
    return storedPeers ? JSON.parse(storedPeers) : [];
  };

  return (
    <>
      {isPeerStarred() ? (
        <UnstarAPeer peerId={peerId} />
      ) : (
        <StarAPeer peerId={peerId} />
      )}
    </>
  );
};

export default CheckStarredPeer;
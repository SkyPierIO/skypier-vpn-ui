import Typography from '@mui/material/Typography';

// Components 
import UtilityCard from "../components/UtilityCard";
import PeerCard from '../components/PeerCard';

const SavedPeers = () => {

  const getStarredPeers = (): string[] => {
    const storedPeers = localStorage.getItem('starredPeers');
    return storedPeers ? JSON.parse(storedPeers) : [];
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom color="text.primary">
        <UtilityCard title="👷 Work in progress" content={"Feature coming soon..."}>


        </UtilityCard>
      </Typography>
      <Typography variant='h6'>
        Starred Peers
      </Typography>
      <ul>
      {getStarredPeers().map((peerId: string) => (
        /// generate a MUI List displaying the different peers
          <li key={peerId}>{peerId}</li>
        ))}
      </ul>
    </div>
  );
};
export default SavedPeers;

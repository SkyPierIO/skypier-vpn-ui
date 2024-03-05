import {Link } from 'react-router-dom';

const SavedPeers = () => {

  return (
    <div>
      <h1>SavedPeers</h1>
      <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
      </ul>
      <Link to="/">Home</Link>
      <Link to="/peers">Peers</Link>
    </div>
  );
};
export default SavedPeers;

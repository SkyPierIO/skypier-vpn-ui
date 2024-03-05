import {Link } from 'react-router-dom';

const Settings = () => {

  return (
    <div>
      <h1>Settings</h1>
      <Link to="/">Home</Link>
      <Link to="/peers">Peers</Link>
    </div>
  );
};
export default Settings;

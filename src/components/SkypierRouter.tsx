import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';

// PAGES
import Dashboard from "../pages/Dashboard";
import Peers from "../pages/Peers";
import SavedPeers from "../pages/SavedPeers";
import Subscription from "../pages/Subscription";
import Settings from "../pages/Settings";
import Host from "../pages/Host";
import Goodbye from '../pages/Goodbye';

export default function SkypierRouter() {

    return (
        <>        
            <BrowserRouter>      
                <Routes>
                    <Route path="/" element={<Peers/>}/>
                    <Route path="/Dashboard" element={<Dashboard/>}/>
                    <Route path="/Explore_peers" element={<Peers/>}/>
                    <Route path="/Saved_peers" element={<SavedPeers/>}/>
                    <Route path="/My_subscription" element={<Subscription/>}/>
                    <Route path="/Host_a_node" element={<Host/>}/>
                    <Route path="/Settings" element={<Settings/>}/>
                    <Route path="/Goodbye" element={<Goodbye/>}/>
                </Routes>
            </BrowserRouter>
        </>
    );
}
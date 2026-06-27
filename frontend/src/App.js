import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Runs from "./pages/Runs";
import Compare from "./pages/Compare";
import Registry from "./pages/Registry";
import Artifacts from "./pages/Artifacts";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Dashboard />}
                />

                <Route
                    path="/runs"
                    element={<Runs />}
                />

                <Route
                    path="/compare"
                    element={<Compare />}
                />

                <Route
                    path="/registry"
                    element={<Registry />}
                />

                <Route
                    path="/artifacts"
                    element={<Artifacts />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;
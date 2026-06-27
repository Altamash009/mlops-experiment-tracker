import {

FaBell,

FaUserCircle

} from "react-icons/fa";

function Navbar(){

return(

<div className="h-20 bg-white shadow-card flex justify-between items-center px-10">

<div>

<h1 className="text-3xl font-bold">

MLOps Experiment Tracker

</h1>

<p className="text-gray-500">

Monitor experiments and model lifecycle

</p>

</div>

<div className="flex gap-6 text-2xl">

<FaBell className="cursor-pointer hover:text-primary transition"/>

<FaUserCircle className="cursor-pointer hover:text-primary transition"/>

</div>

</div>

);

}

export default Navbar;
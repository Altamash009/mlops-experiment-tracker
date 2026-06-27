import {

FaChartLine,

FaDatabase,

FaExchangeAlt,

FaProjectDiagram,

FaCube

} from "react-icons/fa";

import {

NavLink

} from "react-router-dom";

function Sidebar(){

const menu=[

{
name:"Dashboard",
icon:<FaChartLine />,
path:"/"
},

{
name:"Runs",
icon:<FaDatabase />,
path:"/runs"
},

{
name:"Compare",
icon:<FaExchangeAlt />,
path:"/compare"
},

{
name:"Registry",
icon:<FaProjectDiagram />,
path:"/registry"
},

{
name:"Artifacts",
icon:<FaCube />,
path:"/artifacts"
}

];

return(

<div className="w-64 bg-secondary text-white flex flex-col shadow-card">

<div className="text-3xl font-bold px-8 py-8 border-b border-slate-700">

MLOps

</div>

<nav className="flex-1 p-5">

{

menu.map(item=>(

<NavLink

key={item.name}

to={item.path}

className={({isActive})=>

`flex items-center gap-3 px-4 py-3 rounded-xl mb-3 transition-all duration-300

${

isActive

?

"bg-primary"

:

"hover:bg-slate-700"

}

`

}

>

{item.icon}

{item.name}

</NavLink>

))

}

</nav>

</div>

);

}

export default Sidebar;

export default function PriorityLegend() {

return (

<div className="flex items-center gap-4 text-md text-gray-800 dark:text-white/70">

<div className="flex items-center gap-1">
<span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
High
</div>

<div className="flex items-center gap-1">
<span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
Medium
</div>

<div className="flex items-center gap-1">
<span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
Low
</div>

</div>

)
}

import { PackageCheck, Layers, Boxes } from 'lucide-react'

export function getItemTypeBadge(type) {
    if (type === 'finished_good') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#193b35]/10 px-2 py-0.5 text-xs font-semibold text-[#193b35] ring-1 ring-[#193b35]/20">
                <PackageCheck size={12} className="text-[#193b35]" />
                Finished Good
            </span>
        )
    }

    if (type === 'semi_finished') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#e69c78]/25 px-2 py-0.5 text-xs font-semibold text-[#8f4724] ring-1 ring-[#8f4724]/20">
                <Layers size={12} className="text-[#8f4724]" />
                Semi-Finished
            </span>
        )
    }

    if (type === 'raw_material') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-800 ring-1 ring-sky-300/60">
                <Boxes size={12} className="text-sky-700" />
                Raw Material
            </span>
        )
    }

    return (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            {type || 'Unknown'}
        </span>
    )
}
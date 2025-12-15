import React, { useState } from 'react';
import { 
    ChevronDown, ChevronRight, Wind, Thermometer, 
    Zap, Pickaxe, Sprout, PawPrint, Users, Building, 
    Globe, Activity 
} from 'lucide-react';

// A simple badge component for things like "Rocky", "Safe", etc.
const Badge = ({ children, color = "bg-slate-100 text-slate-600" }) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color} border border-black/5`}>
        {children}
    </span>
);

const ModernPlanetCard = ({ planet }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!planet) return null;

    return (
        <div className="bg-white border border-slate-200 rounded-xl mb-3 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Header / Trigger */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div 
                        className="w-8 h-8 rounded-full shadow-inner flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: planet.planetColor }}
                    >
                        {planet.planetName.substring(0, 1)}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{planet.planetName}</h4>
                        <span className={`text-[10px] uppercase tracking-wider font-semibold ${planet.hasCivilization ? 'text-green-600' : 'text-slate-400'}`}>
                            {planet.planetType}
                        </span>
                    </div>
                </div>
                {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
            </div>

            {/* Expanded Content */}
            {isOpen && (
                <div className="p-4 pt-0 text-sm text-slate-600 space-y-4">
                    
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-slate-50 p-2 rounded border border-slate-100 flex items-center gap-2">
                            <Activity size={14} className="text-blue-400" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase">Gravity</span>
                                <span className="font-mono text-xs">{planet.gravity}g</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100 flex items-center gap-2">
                            <Globe size={14} className="text-emerald-400" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase">Size</span>
                                <span className="font-mono text-xs">Class {planet.planetSize}</span>
                            </div>
                        </div>
                    </div>

                    {/* Inhabitants */}
                    {planet.inhabitants?.length > 0 && (
                        <div>
                            <h5 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                                <Users size={12} /> Demographics
                            </h5>
                            <div className="space-y-1">
                                {planet.inhabitants.map((species, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white border border-slate-100 px-2 py-1 rounded">
                                        <span className="text-xs font-medium text-slate-700">{species.speciesName}</span>
                                        <Badge color="bg-green-50 text-green-700 border-green-100">{species.populationPercentage}%</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Settlements */}
                    {planet.settlements?.length > 0 && (
                        <div>
                            <h5 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                                <Building size={12} /> Key Settlements
                            </h5>
                            <div className="flex flex-wrap gap-1">
                                {planet.settlements.map((s, i) => (
                                    <Badge key={i} color={s.isCapital ? 'bg-amber-100 text-amber-800 border-amber-200' : undefined}>
                                        {s.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Resources (Tags) */}
                    {planet.resourceList?.length > 0 && (
                        <div>
                            <h5 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                                <Pickaxe size={12} /> Resources
                            </h5>
                            <div className="flex flex-wrap gap-1">
                                {planet.resourceList.map((r, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200">
                                        {r.mineralName}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export default ModernPlanetCard;
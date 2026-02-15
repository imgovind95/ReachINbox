import { Search } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    suggestions: string[];
    onSuggestionClick: (value: string) => void;
}

export const SearchBar = ({ value, onChange, suggestions, onSuggestionClick }: SearchBarProps) => {
    return (
        <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={18} />
            <input
                type="text"
                placeholder="Search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-gray-100 pl-10 pr-4 py-2.5 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all border border-transparent focus:border-green-100"
            />
            {value && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-20">
                    <div className="p-2">
                        <div className="text-xs font-semibold text-gray-400 px-3 py-1 uppercase tracking-wider">Suggestions</div>
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => onSuggestionClick(suggestion)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md transition-colors flex items-center gap-2"
                            >
                                <Search size={14} className="opacity-50" />
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

import { Search, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    suggestions: string[];
    onSuggestionClick: (value: string) => void;
}

export const SearchBar = ({ value, onChange, suggestions, onSuggestionClick }: SearchBarProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSuggestionClick = (suggestion: string) => {
        onSuggestionClick(suggestion);
        setIsFocused(false);
    };

    const showSuggestions = isFocused && value && suggestions.length > 0 && !(suggestions.length === 1 && suggestions[0] === value);

    return (
        <div ref={wrapperRef} className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={18} />
            <input
                type="text"
                placeholder="Search"
                value={value}
                onChange={(e) => { onChange(e.target.value); setIsFocused(true); }}
                onFocus={() => setIsFocused(true)}
                className="w-full bg-gray-100 pl-10 pr-10 py-2.5 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all border border-transparent focus:border-green-100"
            />
            {value && (
                <button
                    onClick={() => { onChange(''); setIsFocused(true); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    <X size={14} />
                </button>
            )}

            {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-20">
                    <div className="p-2">
                        <div className="text-xs font-semibold text-gray-400 px-3 py-1 uppercase tracking-wider">Suggestions</div>
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
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

import { Filter, RotateCcw } from 'lucide-react';
import { SearchBar } from './SearchBar';

interface TopBarProps {
    itemCount: number;
    isLoading: boolean;
    onRefresh?: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    suggestions: string[];
}

export const TopBar = ({ itemCount, isLoading, onRefresh, searchQuery, onSearchChange, suggestions }: TopBarProps) => {
    const handleSuggestionClick = (value: string) => {
        onSearchChange(value);
    };

    return (
        <div className="px-8 py-6 flex items-center gap-4 border-b border-gray-100">
            <SearchBar
                value={searchQuery}
                onChange={onSearchChange}
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
            />
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Filter size={20} />
                {itemCount >= 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center shadow-sm border-2 border-white">
                        {itemCount}
                    </span>
                )}
            </button>
            <button
                onClick={onRefresh}
                disabled={isLoading}
                className={`p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors ${isLoading ? 'animate-spin text-green-600' : ''}`}
            >
                <RotateCcw size={18} />
            </button>
        </div>
    );
};

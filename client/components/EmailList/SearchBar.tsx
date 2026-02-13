import { Search } from 'lucide-react';

export const SearchBar = () => {
    return (
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
                type="text"
                placeholder="Search"
                className="w-full bg-gray-100 pl-10 pr-4 py-2.5 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500/20"
            />
        </div>
    );
};

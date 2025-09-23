'use client';

import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SearchAndFilterProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  placeholder?: string;
}

export function SearchAndFilter({
  searchValue = '',
  onSearchChange = () => {},
  onFilterClick = () => {},
  placeholder = 'Search by child name, parent name, or email...',
}: SearchAndFilterProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={placeholder}
              className="w-full"
            />
          </div>
          <Button variant="outline">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={onFilterClick}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Search, Building2 } from 'lucide-react';
import { getHostelmates } from '@/lib/storage';
import { HostelMate } from '@/types/hostel';

export const HostelDirectory = () => {
  const [search, setSearch] = useState('');
  const hostelmates = getHostelmates();

  const filtered = hostelmates.filter(mate =>
    mate.name.toLowerCase().includes(search.toLowerCase()) ||
    mate.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
    mate.hostelBlock.toLowerCase().includes(search.toLowerCase())
  );

  const groupedByBlock = filtered.reduce((acc, mate) => {
    if (!acc[mate.hostelBlock]) {
      acc[mate.hostelBlock] = [];
    }
    acc[mate.hostelBlock].push(mate);
    return acc;
  }, {} as Record<string, HostelMate[]>);

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Hostel Directory
          </CardTitle>
          <CardDescription>
            Find your hostelmates by name or room number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, room, or block..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {Object.entries(groupedByBlock).map(([block, mates]) => (
        <Card key={block} className="shadow-card">
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              {block}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-border">
              {mates.map((mate) => (
                <div key={mate.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {mate.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{mate.name}</p>
                      {mate.course && (
                        <p className="text-xs text-muted-foreground">
                          {mate.course} • {mate.year}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{mate.roomNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {filtered.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="py-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <p className="mt-3 text-muted-foreground">No hostelmates found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Calendar, User, CheckCircle2, Clock } from 'lucide-react';

export interface ActivityCardProps {
  title: string;
  description: string;
  timestamp: string;
  author: string;
  type?: 'approval' | 'update' | 'milestone' | 'warning';
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  description,
  timestamp,
  author,
  type = 'update',
}) => {
  const typeIcons = {
    approval: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    update: <Clock className="w-4 h-4 text-blue-500" />,
    milestone: <Calendar className="w-4 h-4 text-amber-500" />,
    warning: <Clock className="w-4 h-4 text-rose-500" />,
  };

  return (
    <Card className="hover:border-slate-300 transition-colors">
      <CardContent className="p-4 flex gap-3">
        <div className="p-2 bg-slate-50 rounded-lg h-fit border border-slate-200/60">{typeIcons[type]}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{description}</p>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> {author}
            </span>
            <span>•</span>
            <span>{timestamp}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

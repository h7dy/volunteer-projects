'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { joinProject, leaveProject } from '@/app/actions/participation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Leaf, Check, MapPin, Calendar, XCircle } from "lucide-react";

interface ProjectCardProps {
  project: {
    _id: string;
    title: string;
    description: string;
    status: string;
    location?: string;
    startDate?: Date;
  };
  isJoined: boolean;
}

export default function ProjectCard({ project, isJoined }: ProjectCardProps) {
  const [isPending, startTransition] = useTransition();

  // Helper: Only 'active' projects can be joined
  const isActive = project.status === 'active';

  // Helper: Date Formatting
  const formattedDate = project.startDate 
    ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const handleToggle = () => {
    if (!isActive && !isJoined) return; // Prevent joining closed projects

    startTransition(async () => {
      if (isJoined) {
        await leaveProject(project._id);
      } else {
        await joinProject(project._id);
      }
    });
  };

  return (
    <Card className={`flex flex-col h-full transition-all duration-200 hover:shadow-md 
      ${isJoined ? 'border-emerald-500/50 bg-emerald-50/10' : ''}
      ${!isActive && !isJoined ? 'opacity-75 bg-slate-50' : ''} 
    `}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Link 
                href={`/projects/${project._id}`} 
                className="hover:text-emerald-600 transition-colors line-clamp-1"
              >
                {project.title}
              </Link>
            </CardTitle>
            
            {/* STATUS BADGES */}
            <div className="flex gap-2">
              {isJoined && (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  <Check className="w-3 h-3 mr-1" /> Enrolled
                </Badge>
              )}
              {!isActive && (
                <Badge variant="outline" className="text-slate-500">
                  {project.status}
                </Badge>
              )}
            </div>
          </div>

          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-3">
        {/* Date & Location Row */}
        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
          {project.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{project.location}</span>
            </div>
          )}
          {formattedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>

        <CardDescription className="text-sm leading-relaxed text-slate-600 line-clamp-3">
          {project.description}
        </CardDescription>
      </CardContent>

      <CardFooter className="pt-4 gap-2">
        <Button variant="outline" className="flex-1" asChild>
          <Link href={`/projects/${project._id}`}>
            Details
          </Link>
        </Button>

        <Button 
          onClick={handleToggle}
          disabled={isPending || (!isActive && !isJoined)} 
          variant={isJoined ? "destructive" : "default"}
          className={`flex-1 ${!isJoined && isActive ? "bg-slate-900 hover:bg-slate-800" : ""}`}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isJoined ? (
            "Leave"
          ) : !isActive ? (
            "Closed"
          ) : (
            "Join"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
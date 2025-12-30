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
import { Loader2, Leaf, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { CapacityBadge } from "@/components/capacityBadge";

interface ProjectCardProps {
  project: {
    _id: string;
    title: string;
    description: string;
    status: string;
    location?: string;
    startDate?: Date | string;
    capacity?: number | null;
    enrolledCount: number;
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

  // Helper: Check Capacity
  const isFull = project.capacity ? project.enrolledCount >= project.capacity : false;

  const handleToggle = () => {
    // Prevent joining if closed OR (full AND not already joined)
    if ((!isActive || isFull) && !isJoined) return;

    startTransition(async () => {
      if (isJoined) {
        await leaveProject(project._id);
      } else {
        await joinProject(project._id);
      }
    });
  };

  return (
    <Card className={`flex flex-col h-full transition-all duration-200 hover:shadow-md relative overflow-hidden
      ${isJoined ? 'border-emerald-500 ring-1 ring-emerald-500/20 bg-emerald-50/10' : ''}
      ${!isActive && !isJoined ? 'opacity-75 bg-slate-50' : ''} 
    `}>
      
      {/* VISUAL INDICATOR FOR ENROLLED STATE */}
      {isJoined && (
        <div className="absolute top-0 right-0 p-0">
          <div className="bg-emerald-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg shadow-sm flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Joined
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5 w-full">
            <CardTitle className="text-lg md:text-xl font-bold leading-tight line-clamp-2 pr-6">
              <Link 
                href={`/projects/${project._id}`} 
                className="hover:text-emerald-700 transition-colors"
              >
                {project.title}
              </Link>
            </CardTitle>
            
            <div className="flex flex-wrap gap-2 pt-1 items-center">
              {/* CAPACITY BADGE */}
              <CapacityBadge 
                current={project.enrolledCount} 
                max={project.capacity} 
              />

              {/* STATUS BADGE (Only if not active) */}
              {!isActive && (
                <Badge variant="outline" className="text-slate-500 bg-slate-100 border-slate-200">
                  {project.status}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Icon (Hidden if joined to make room for the 'Joined' banner) */}
          {!isJoined && (
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5 text-emerald-600" />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        {/* Date & Location Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-500 bg-slate-50/50 p-2 rounded-md border border-slate-100">
          {formattedDate && (
            <div className="flex items-center gap-2 min-w-fit">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-700">{formattedDate}</span>
            </div>
          )}
          
          {/* Separator for desktop */}
          {formattedDate && project.location && (
            <span className="hidden sm:inline text-slate-300">|</span>
          )}

          {project.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{project.location}</span>
            </div>
          )}
        </div>

        <CardDescription className="text-sm leading-relaxed text-slate-600 line-clamp-3">
          {project.description}
        </CardDescription>
      </CardContent>

      <CardFooter className="pt-2 pb-4 gap-3 flex-col sm:flex-row">
        <Button variant="outline" className="w-full sm:flex-1 h-10 border-slate-200 hover:bg-slate-50" asChild>
          <Link href={`/projects/${project._id}`}>
            View Details
          </Link>
        </Button>

        <Button 
          onClick={handleToggle}
          disabled={isPending || (!isJoined && (!isActive || isFull))} 
          variant={isJoined ? "destructive" : "default"}
          className={`w-full sm:flex-1 h-10 shadow-sm transition-all
            ${isJoined 
              ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200" 
              : !isActive 
                ? "opacity-50" 
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }
          `}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isJoined ? (
            "Leave Project"
          ) : !isActive ? (
            "Closed"
          ) : isFull ? (
            "Full"
          ) : (
            "Join Now"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
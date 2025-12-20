'use client';

import { useTransition } from 'react';
import Link from 'next/link'; // <--- ADDED
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
import { Loader2, Leaf, Check, ArrowRight } from "lucide-react";

interface ProjectCardProps {
  project: {
    _id: string;
    title: string;
    description: string;
  };
  isJoined: boolean;
}

export default function ProjectCard({ project, isJoined }: ProjectCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      if (isJoined) {
        await leaveProject(project._id);
      } else {
        await joinProject(project._id);
      }
    });
  };

  return (
    <Card className={`flex flex-col h-full transition-all duration-200 hover:shadow-md ${isJoined ? 'border-emerald-500/50 bg-emerald-50/10' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              {/* LINK TITLE TO DETAILS PAGE */}
              <Link 
                href={`/projects/${project._id}`} 
                className="hover:text-emerald-600 transition-colors"
              >
                {project.title}
              </Link>
            </CardTitle>
            
            {isJoined && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                <Check className="w-3 h-3 mr-1" /> Enrolled
              </Badge>
            )}
          </div>
          {/* Icon Badge */}
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <CardDescription className="text-sm leading-relaxed text-slate-600 line-clamp-3">
          {project.description}
        </CardDescription>
      </CardContent>

      <CardFooter className="pt-4 gap-2">
        {/* VIEW DETAILS BUTTON (Secondary) */}
        <Button variant="outline" className="flex-1" asChild>
          <Link href={`/projects/${project._id}`}>
            Details
          </Link>
        </Button>

        {/* QUICK ACTION BUTTON (Primary) */}
        <Button 
          onClick={handleToggle}
          disabled={isPending}
          variant={isJoined ? "destructive" : "default"}
          className={`flex-1 ${!isJoined && "bg-slate-900 hover:bg-slate-800"}`}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isJoined ? (
            "Leave"
          ) : (
            "Join"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
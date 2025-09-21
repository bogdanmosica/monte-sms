'use client';

import {
  BookOpen,
  Calendar,
  Clock,
  MessageCircle,
  Plus,
  TrendingUp,
  User,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockChildren } from '@/lib/mock-data';

// Mock kanban tasks
const mockTasks = [
  {
    id: '1',
    title: 'Introduce Pink Tower to Emma',
    description:
      'Begin sensorial work with the pink tower, focusing on size discrimination',
    student: 'Emma Johnson',
    category: 'sensorial',
    priority: 'high',
    dueDate: '2024-01-20',
    status: 'todo',
  },
  {
    id: '2',
    title: 'Review Number Rods with Liam',
    description:
      'Continue mathematics work, ensure understanding of 1-10 sequence',
    student: 'Liam Chen',
    category: 'mathematics',
    priority: 'medium',
    dueDate: '2024-01-18',
    status: 'in_progress',
  },
  {
    id: '3',
    title: 'Practical Life Assessment - Sophia',
    description:
      "Observe and document Sophia's progress with pouring exercises",
    student: 'Sophia Rodriguez',
    category: 'practical_life',
    priority: 'low',
    dueDate: '2024-01-22',
    status: 'in_progress',
  },
  {
    id: '4',
    title: 'Parent Conference Prep - Emma',
    description:
      'Prepare materials and notes for upcoming parent-teacher conference',
    student: 'Emma Johnson',
    category: 'administrative',
    priority: 'high',
    dueDate: '2024-01-19',
    status: 'done',
  },
  {
    id: '5',
    title: 'Language Cards Introduction',
    description: 'Introduce three-part cards for vocabulary building',
    student: 'Liam Chen',
    category: 'language',
    priority: 'medium',
    dueDate: '2024-01-25',
    status: 'todo',
  },
];

const getStatusTasks = (status: string) =>
  mockTasks.filter((task) => task.status === status);

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-destructive/20 text-destructive border-destructive/30';
    case 'medium':
      return 'bg-primary/20 text-primary border-primary/30';
    case 'low':
      return 'bg-secondary/20 text-secondary-foreground border-secondary/30';
    default:
      return 'bg-muted text-muted-foreground border-muted';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'practical_life':
      return 'bg-primary/20 text-primary';
    case 'sensorial':
      return 'bg-accent/20 text-accent';
    case 'mathematics':
      return 'bg-secondary/20 text-secondary-foreground';
    case 'language':
      return 'bg-muted text-muted-foreground';
    case 'administrative':
      return 'bg-destructive/20 text-destructive';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

function KanbanColumn({
  title,
  tasks,
  status,
}: {
  title: string;
  tasks: any[];
  status: string;
}) {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="secondary">{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => {
          const student = mockChildren.find(
            (child) => child.name === task.student
          );
          return (
            <Card
              key={task.id}
              className="border-l-4 border-l-primary cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <Badge
                      className={getPriorityColor(task.priority)}
                      variant="outline"
                    >
                      {task.priority}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {task.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <Badge
                      className={getCategoryColor(task.category)}
                      variant="outline"
                    >
                      {task.category.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {student && (
                        <>
                          <Avatar className="h-6 w-6 bg-accent/20">
                            <AvatarFallback className="text-accent text-xs">
                              {student.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {student.name}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {tasks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No tasks in this column
            </p>
          </div>
        )}

        <Button variant="outline" className="w-full bg-transparent" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </CardContent>
    </Card>
  );
}

export default function TeacherKanban() {
  const todoTasks = getStatusTasks('todo');
  const inProgressTasks = getStatusTasks('in_progress');
  const doneTasks = getStatusTasks('done');

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Task Management
              </h1>
              <p className="text-muted-foreground">
                Organize and track classroom activities and administrative tasks
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>

          {/* Task Summary */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {mockTasks.length}
                </div>
                <p className="text-xs text-muted-foreground">Active tasks</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  To Do
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {todoTasks.length}
                </div>
                <p className="text-xs text-muted-foreground">Pending tasks</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {inProgressTasks.length}
                </div>
                <p className="text-xs text-muted-foreground">Active tasks</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {doneTasks.length}
                </div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          </div>

          {/* Kanban Board */}
          <div className="flex gap-6 min-h-[600px]">
            <KanbanColumn title="To Do" tasks={todoTasks} status="todo" />
            <KanbanColumn
              title="In Progress"
              tasks={inProgressTasks}
              status="in_progress"
            />
            <KanbanColumn title="Done" tasks={doneTasks} status="done" />
          </div>
        </div>
      </main>
    </div>
  );
}

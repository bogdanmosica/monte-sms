'use client';

import { Calendar, Clock, MessageCircle, Plus, Send } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { UserRole } from '@/lib/db/schema';
import { mockUsers } from '@/lib/mock-data';

// Mock messages data
const mockMessages = [
  {
    id: '1',
    from: 'Maria Montessori',
    role: UserRole.TEACHER,
    subject: "Emma's Progress in Mathematics",
    content:
      "Hi Sarah, I wanted to share some wonderful news about Emma's progress in mathematics. She has shown remarkable improvement with the number rods and is now ready to move on to the golden beads. Her concentration and precision have been exceptional.",
    date: '2024-01-15T10:30:00Z',
    read: false,
  },
  {
    id: '2',
    from: 'Maria Montessori',
    role: UserRole.TEACHER,
    subject: 'Parent-Teacher Conference',
    content:
      "Dear Sarah, I would like to schedule a parent-teacher conference to discuss Emma's overall development and plan for the upcoming month. Please let me know your availability for next week.",
    date: '2024-01-12T14:15:00Z',
    read: true,
  },
  {
    id: '3',
    from: 'Dr. Elizabeth Carter',
    role: UserRole.ADMIN,
    subject: 'School Event: Spring Festival',
    content:
      "Dear Parents, We are excited to announce our annual Spring Festival on March 15th. This will be a wonderful opportunity for families to come together and celebrate our children's achievements. More details to follow.",
    date: '2024-01-10T09:00:00Z',
    read: true,
  },
];

export default function ParentMessages() {
  const currentParent = mockUsers.find((user) => user.role === UserRole.PARENT);
  const unreadCount = mockMessages.filter((msg) => !msg.read).length;

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Messages</h1>
              <p className="text-muted-foreground">
                Communication with teachers and school administration
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">
                    {unreadCount} unread
                  </Badge>
                )}
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>

          {/* Messages List */}
          <div className="grid gap-4">
            {mockMessages.map((message) => (
              <Card
                key={message.id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  !message.read
                    ? 'border-l-4 border-l-primary bg-primary/5'
                    : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-accent/20">
                        <AvatarFallback className="text-accent font-medium">
                          {message.from
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {message.from}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {message.role}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs">
                            <Clock className="w-3 h-3" />
                            {new Date(message.date).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    {!message.read && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium mb-2">{message.subject}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {message.content}
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      Reply
                    </Button>
                    <Button variant="ghost" size="sm">
                      Mark as {message.read ? 'Unread' : 'Read'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Reply Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Quick Message
              </CardTitle>
              <CardDescription>
                Send a message to your child's teacher
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your message here..."
                className="min-h-[100px]"
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 bg-accent/20">
                    <AvatarFallback className="text-accent text-sm">
                      MM
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    To: Maria Montessori (Teacher)
                  </span>
                </div>
                <Button className="bg-primary hover:bg-primary/90">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Empty State */}
          {mockMessages.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No messages yet
                  </h3>
                  <p className="text-muted-foreground">
                    Messages from teachers and school administration will appear
                    here.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

'use client';

import { CalendarIcon, Clock, MapPin, Plus, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';


// Mock events data
const mockEvents = [
  {
    id: '1',
    title: 'Parent-Teacher Conference',
    description:
      "Individual meeting to discuss Emma's progress and development",
    date: '2024-01-20',
    time: '2:00 PM - 2:30 PM',
    location: 'Primary A Classroom',
    type: 'conference',
    attendees: ['Sarah Johnson', 'Maria Montessori'],
  },
  {
    id: '2',
    title: 'Spring Festival Planning Meeting',
    description:
      'Volunteer coordination meeting for the upcoming Spring Festival',
    date: '2024-01-25',
    time: '6:00 PM - 7:00 PM',
    location: 'School Library',
    type: 'meeting',
    attendees: ['Parent Volunteers', 'School Staff'],
  },
  {
    id: '3',
    title: 'Montessori Method Workshop',
    description:
      'Learn about Montessori principles and how to support learning at home',
    date: '2024-02-01',
    time: '10:00 AM - 12:00 PM',
    location: 'Main Hall',
    type: 'workshop',
    attendees: ['All Parents Welcome'],
  },
  {
    id: '4',
    title: 'School Holiday - Presidents Day',
    description: 'School closed for Presidents Day holiday',
    date: '2024-02-19',
    time: 'All Day',
    location: 'N/A',
    type: 'holiday',
    attendees: [],
  },
];

const getEventTypeColor = (type: string) => {
  switch (type) {
    case 'conference':
      return 'bg-primary/20 text-primary border-primary/30';
    case 'meeting':
      return 'bg-accent/20 text-accent border-accent/30';
    case 'workshop':
      return 'bg-secondary/20 text-secondary-foreground border-secondary/30';
    case 'holiday':
      return 'bg-muted text-muted-foreground border-muted';
    default:
      return 'bg-muted text-muted-foreground border-muted';
  }
};

export default function ParentCalendar() {
  const upcomingEvents = mockEvents.filter(
    (event) => new Date(event.date) >= new Date()
  );
  const thisWeekEvents = upcomingEvents.filter((event) => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= today && eventDate <= weekFromNow;
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                School Calendar
              </h1>
              <p className="text-muted-foreground">
                Stay updated with school events, conferences, and important
                dates
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Request Meeting
            </Button>
          </div>

          {/* This Week Section */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                This Week
              </CardTitle>
              <CardDescription>
                Upcoming events in the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {thisWeekEvents.length > 0 ? (
                <div className="space-y-4">
                  {thisWeekEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <CalendarIcon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge className={getEventTypeColor(event.type)}>
                            {event.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </div>
                          {event.location !== 'N/A' && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No events this week
                  </h3>
                  <p className="text-muted-foreground">
                    Check back later for upcoming events and activities.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>All Upcoming Events</CardTitle>
              <CardDescription>
                Complete list of scheduled events and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{event.title}</h4>
                            <Badge className={getEventTypeColor(event.type)}>
                              {event.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.time}
                            </div>
                            {event.location !== 'N/A' && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </div>
                            )}
                            {event.attendees.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {event.attendees.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Empty State */}
          {upcomingEvents.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No upcoming events
                  </h3>
                  <p className="text-muted-foreground">
                    School events and important dates will be displayed here
                    when available.
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

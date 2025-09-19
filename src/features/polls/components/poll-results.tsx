'use client';

import { format } from 'date-fns';
import { BarChart3, Users, Calendar, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PollWithResponses, PollStats } from '../types';

interface PollResultsProps {
  poll: PollWithResponses;
  stats: PollStats;
}

export function PollResults({ poll, stats }: PollResultsProps) {
  const getPollTypeLabel = (type: string) => {
    switch (type) {
      case 'single_choice':
        return 'Single Choice';
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'rating':
        return 'Rating Scale';
      case 'text':
        return 'Text Response';
      default:
        return type;
    }
  };

  const isExpired = () => {
    return poll.expiresAt && Date.now() > poll.expiresAt;
  };

  const getStatusBadge = () => {
    if (isExpired()) {
      return <Badge variant='secondary'>Expired</Badge>;
    }
    if (poll.isActive) {
      return <Badge variant='default'>Active</Badge>;
    }
    return <Badge variant='outline'>Inactive</Badge>;
  };

  const getOptionPercentage = (optionIndex: number) => {
    if (stats.totalResponses === 0) return 0;
    const count = stats.optionCounts[optionIndex.toString()] || 0;
    return Math.round((count / stats.totalResponses) * 100);
  };

  return (
    <div className='space-y-6'>
      {/* Poll Header */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <CardTitle className='text-2xl'>{poll.title}</CardTitle>
                {getStatusBadge()}
              </div>
              <p className='text-lg text-muted-foreground'>{poll.question}</p>
              {poll.description && <p className='text-sm text-muted-foreground'>{poll.description}</p>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
            <div className='flex items-center gap-2'>
              <BarChart3 className='h-4 w-4 text-muted-foreground' />
              <span className='text-muted-foreground'>Type:</span>
              <span>{getPollTypeLabel(poll.pollType)}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-muted-foreground' />
              <span className='text-muted-foreground'>Responses:</span>
              <span className='font-medium'>{stats.totalResponses}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              <span className='text-muted-foreground'>Created:</span>
              <span>{format(new Date(poll.createdAt), 'MMM dd, yyyy')}</span>
            </div>
            <div className='flex items-center gap-2'>
              {poll.allowAnonymous ? (
                <Eye className='h-4 w-4 text-muted-foreground' />
              ) : (
                <EyeOff className='h-4 w-4 text-muted-foreground' />
              )}
              <span className='text-muted-foreground'>Anonymous:</span>
              <span>{poll.allowAnonymous ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {stats.totalResponses > 0 ? (
        <div className='space-y-6'>
          {/* Choice-based poll results */}
          {poll.pollType !== 'text' && poll.options.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Response Distribution</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {poll.options.map((option, index) => {
                  const count = stats.optionCounts[index.toString()] || 0;
                  const percentage = getOptionPercentage(index);

                  return (
                    <div key={index} className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <span className='font-medium'>{option}</span>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm text-muted-foreground'>
                            {count} response{count !== 1 ? 's' : ''}
                          </span>
                          <Badge variant='outline'>{percentage}%</Badge>
                        </div>
                      </div>
                      <Progress value={percentage} className='h-2' />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Text responses */}
          {poll.pollType === 'text' && stats.textResponses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Text Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {stats.textResponses.map((response, index) => (
                    <div key={index} className='p-4 border rounded-lg'>
                      <p className='text-sm'>{response}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Individual responses (if not anonymous) */}
          {!poll.allowAnonymous && poll.responses && poll.responses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Individual Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {poll.responses?.map(response => (
                    <div key={response._id} className='p-4 border rounded-lg'>
                      <div className='flex items-center justify-between mb-2'>
                        <div>
                          <span className='font-medium'>{response.userName}</span>
                          <span className='text-sm text-muted-foreground ml-2'>({response.userEmail})</span>
                        </div>
                        <span className='text-sm text-muted-foreground'>
                          {format(new Date(response.submittedAt), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>

                      {response.selectedOptions.length > 0 && (
                        <div className='mb-2'>
                          <span className='text-sm font-medium'>Selected: </span>
                          {response.selectedOptions.map((optionIndex, idx) => (
                            <Badge key={idx} variant='outline' className='mr-1'>
                              {poll.options[optionIndex]}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {response.textResponse && (
                        <div>
                          <span className='text-sm font-medium'>Response: </span>
                          <p className='text-sm mt-1'>{response.textResponse}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <MessageSquare className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-medium mb-2'>No responses yet</h3>
            <p className='text-muted-foreground text-center'>
              This poll hasn't received any responses yet. Share it with your tenants to start collecting feedback.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

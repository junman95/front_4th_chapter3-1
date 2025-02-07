import { useToast } from '@chakra-ui/react';
import React from 'react';

import { Event, EventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

interface Data {
  events: Event[];
  event: Event | EventForm;
  editingEvent: Event | null;
  isRepeating: boolean;
  setOverlappingEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  setIsOverlapDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;

  saveEvent: (event: Event | EventForm) => Promise<void>;
  resetForm: () => void;
  errors: {
    startTimeError: string | null;
    endTimeError: string | null;
  };
}

const useChangeEvent = ({
  events,
  event,
  editingEvent,
  isRepeating,
  setOverlappingEvents,
  setIsOverlapDialogOpen,
  saveEvent,
  resetForm,
  errors,
}: Data) => {
  const {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    repeat,
    notificationTime,
  } = event;
  const { startTimeError, endTimeError } = errors;
  const toast = useToast();

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeat.type : 'none',
        interval: repeat.interval,
        endDate: repeat.endDate || undefined,
      },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  return {
    addOrUpdateEvent,
  };
};

export { useChangeEvent };

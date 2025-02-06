import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Select,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';

import EventList from './components/EventList.tsx';
import MonthView from './components/MothView.tsx';
import NotificationList from './components/NotificationList.tsx';
import OverlapAlertDialog from './components/OverlapAlertDialog.tsx';
import WeekView from './components/WeekView.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useChangeEvent } from './hooks/useChangeEvent.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, RepeatType } from './types';
import { getTimeErrorMessage } from './utils/timeValidation';

const categories = ['업무', '개인', '가족', '기타'];

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

function App() {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  } = useEventForm();

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const { addOrUpdateEvent } = useChangeEvent({
    events,
    event: {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    },
    errors: { startTimeError, endTimeError },
    saveEvent,
    editingEvent,
    isRepeating,
    resetForm,
    setIsOverlapDialogOpen,
    setOverlappingEvents,
  });

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <VStack w="400px" spacing={5} align="stretch">
          <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

          <FormControl>
            <FormLabel>제목</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>

          <FormControl>
            <FormLabel>날짜</FormLabel>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormControl>

          <HStack width="100%">
            <FormControl>
              <FormLabel>시작 시간</FormLabel>
              <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
                <Input
                  type="time"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  onBlur={() => getTimeErrorMessage(startTime, endTime)}
                  isInvalid={!!startTimeError}
                />
              </Tooltip>
            </FormControl>
            <FormControl>
              <FormLabel>종료 시간</FormLabel>
              <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
                <Input
                  type="time"
                  value={endTime}
                  onChange={handleEndTimeChange}
                  onBlur={() => getTimeErrorMessage(startTime, endTime)}
                  isInvalid={!!endTimeError}
                />
              </Tooltip>
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel>설명</FormLabel>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormControl>

          <FormControl>
            <FormLabel>위치</FormLabel>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </FormControl>

          <FormControl>
            <FormLabel>카테고리</FormLabel>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">카테고리 선택</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>반복 설정</FormLabel>
            <Checkbox isChecked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)}>
              반복 일정
            </Checkbox>
          </FormControl>

          <FormControl>
            <FormLabel>알림 설정</FormLabel>
            <Select
              value={notificationTime}
              onChange={(e) => setNotificationTime(Number(e.target.value))}
            >
              {notificationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormControl>

          {isRepeating && (
            <VStack width="100%">
              <FormControl>
                <FormLabel>반복 유형</FormLabel>
                <Select
                  value={repeatType}
                  onChange={(e) => setRepeatType(e.target.value as RepeatType)}
                >
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                  <option value="monthly">매월</option>
                  <option value="yearly">매년</option>
                </Select>
              </FormControl>
              <HStack width="100%">
                <FormControl>
                  <FormLabel>반복 간격</FormLabel>
                  <Input
                    type="number"
                    value={repeatInterval}
                    onChange={(e) => setRepeatInterval(Number(e.target.value))}
                    min={1}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>반복 종료일</FormLabel>
                  <Input
                    type="date"
                    value={repeatEndDate}
                    onChange={(e) => setRepeatEndDate(e.target.value)}
                  />
                </FormControl>
              </HStack>
            </VStack>
          )}

          <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
            {editingEvent ? '일정 수정' : '일정 추가'}
          </Button>
        </VStack>

        <VStack flex={1} spacing={5} align="stretch">
          <Heading>일정 보기</Heading>

          <HStack mx="auto" justifyContent="space-between">
            <IconButton
              aria-label="Previous"
              icon={<ChevronLeftIcon />}
              onClick={() => navigate('prev')}
            />
            <Select
              aria-label="view"
              value={view}
              onChange={(e) => setView(e.target.value as 'week' | 'month')}
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
            </Select>
            <IconButton
              aria-label="Next"
              icon={<ChevronRightIcon />}
              onClick={() => navigate('next')}
            />
          </HStack>

          {view === 'week' && WeekView({ currentDate, weekDays, filteredEvents, notifiedEvents })}
          {view === 'month' &&
            MonthView({
              currentDate,
              weekDays,
              holidays,
              filteredEvents,
              notifiedEvents,
            })}
        </VStack>

        <EventList
          filteredEvents={filteredEvents}
          notificationOptions={notificationOptions}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          deleteEvent={deleteEvent}
          notifiedEvents={notifiedEvents}
          editEvent={editEvent}
        />
      </Flex>

      {notifications.length > 0 && (
        <NotificationList notifications={notifications} setNotifications={setNotifications} />
      )}

      <OverlapAlertDialog
        event={{
          id: editingEvent ? editingEvent.id : undefined,
          title,
          date,
          startTime,
          endTime,
          description,
          location,
          category,
          repeat: {
            type: isRepeating ? repeatType : 'none',
            interval: repeatInterval,
            endDate: repeatEndDate || undefined,
          },
          notificationTime,
        }}
        editingEvent={editingEvent}
        saveEvent={saveEvent}
        isOverlapDialogOpen={isOverlapDialogOpen}
        setIsOverlapDialogOpen={setIsOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        isRepeating={isRepeating}
      />
    </Box>
  );
}

export default App;

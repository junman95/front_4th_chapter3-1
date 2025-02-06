import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerFetching,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event, EventForm } from '../types';

const appSetup = async () => {
  await render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
  const user = userEvent.setup();

  return { user };
};
describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-02-01T00:00:00'));
  });

  afterEach(() => {
    vi.clearAllTimers();
  });
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const { user } = await appSetup();

    const formData: EventForm = {
      title: '준만회의',
      date: '2025-02-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0, endDate: '2025-10-15' },
      notificationTime: 10,
    };

    const titleField = screen.getByLabelText<HTMLInputElement>('제목');
    await user.type(titleField, formData.title);
    expect(titleField.value).toBe(formData.title);

    const dateField = screen.getByLabelText<HTMLInputElement>('날짜');
    await user.type(dateField, formData.date);
    expect(dateField.value).toBe(formData.date);

    const startTimeField = screen.getByLabelText<HTMLInputElement>('시작 시간');
    await user.type(startTimeField, formData.startTime);
    expect(startTimeField.value).toBe(formData.startTime);

    const endTimeField = screen.getByLabelText<HTMLInputElement>('종료 시간');
    await user.type(endTimeField, formData.endTime);
    expect(endTimeField.value).toBe(formData.endTime);

    const descriptionField = screen.getByLabelText<HTMLInputElement>('설명');
    await user.type(descriptionField, formData.description);
    expect(descriptionField.value).toBe(formData.description);

    const locationField = screen.getByLabelText<HTMLInputElement>('위치');
    await user.type(locationField, formData.location);
    expect(locationField.value).toBe(formData.location);

    const categoryField = screen.getByLabelText<HTMLSelectElement>('카테고리');
    await user.selectOptions(categoryField, formData.category);
    expect(categoryField.value).toBe(formData.category);

    const repeatField = screen.getByLabelText<HTMLInputElement>('반복 설정');
    if (formData.repeat.type === 'none') {
      await user.click(repeatField);
    }

    const notificationTimeField = screen.getByLabelText<HTMLSelectElement>('알림 설정');
    await user.selectOptions(notificationTimeField, formData.notificationTime.toString());

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    const eventList = screen.getByTestId('event-list');

    expect(await within(eventList).findByText(formData.title)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.

    setupMockHandlerCreation([
      {
        id: '1',
        title: '회의',
        date: '2025-02-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '새로운 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0, endDate: '2025-10-15' },
        notificationTime: 10,
      },
    ]);
    const { user } = await appSetup();

    const formData: Pick<EventForm, 'title'> = {
      title: '바뀐회의',
    };

    const editIconButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editIconButtons[0]);

    const titleField = screen.getByLabelText<HTMLInputElement>('제목');
    await user.clear(titleField);
    await user.type(titleField, formData.title);
    expect(titleField.value).toBe(formData.title);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    const eventList = screen.getByTestId('event-list');

    expect(await within(eventList).findByText(formData.title)).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const willBeDeletedEvent: Event = {
      id: '1',
      title: '지워질회의',
      date: '2025-02-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0, endDate: '2025-10-15' },
      notificationTime: 10,
    };
    setupMockHandlerDeletion([willBeDeletedEvent]);

    const { user } = await appSetup();

    const eventList = screen.getByTestId('event-list');

    const deleteIconButtons = await screen.findAllByLabelText('Delete event');
    console.log(deleteIconButtons);
    await user.click(deleteIconButtons[0]);

    expect(within(eventList).queryByText(willBeDeletedEvent.title)).toBeNull();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {});

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {});

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {});

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {});

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {});
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {});

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {});

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {});
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {});

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {});
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {});

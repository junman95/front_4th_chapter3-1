import { alarmEvents } from '../../__mocks__/data/events';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-10-01T09:50:00'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    // 10:00에 알림이 도래하는 이벤트 10분 전부터 유효
    const result = getUpcomingEvents(alarmEvents, new Date(), []);
    expect(result.length).toBe(1);
    expect(result).toEqual([alarmEvents[0]]);

    // 10:00에 알림이 도래하는 이벤트 60분 전부터 유효
    const result2 = getUpcomingEvents(alarmEvents, new Date('2024-10-15T10:00:00'), []);
    expect(result2.length).toBe(1);
    expect(result2).toEqual([alarmEvents[1]]);

    // 10:00에 알림이 도래하는 이벤트 60분 전부터 유효
    const result3 = getUpcomingEvents(alarmEvents, new Date('2024-10-15T09:00:00'), []);
    expect(result3.length).toBe(0);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const result = getUpcomingEvents(alarmEvents, new Date(), ['1']);
    expect(result.length).toBe(0);

    const result2 = getUpcomingEvents(alarmEvents, new Date('2024-10-15T10:00:00'), ['2']);
    expect(result2.length).toBe(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents(alarmEvents, new Date('2024-10-15T09:50:00'), []);
    expect(result.length).toBe(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents(alarmEvents, new Date('2024-10-15T11:10:00'), []);
    expect(result.length).toBe(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const message = createNotificationMessage(alarmEvents[0]);
    expect(message).toBe('10분 후 기존 회의 일정이 시작됩니다.');

    const message2 = createNotificationMessage(alarmEvents[1]);
    expect(message2).toBe('60분 후 신규 회의 일정이 시작됩니다.');
  });
});

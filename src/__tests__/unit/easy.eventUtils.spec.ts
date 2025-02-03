import { edgeEvents, events as mockEvents } from '../../__mocks__/data/events';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-10-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    // id:2 이벤트만 이벤트 2 를 가지고 있다.
    const filteredEvents = getFilteredEvents(mockEvents, '이벤트 2', new Date(), 'month');
    expect(filteredEvents.length).toBe(1);
    expect(filteredEvents).toEqual(mockEvents.filter((event) => event.id === '2'));
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', new Date('2024-07-01'), 'week');
    expect(filteredEvents.length).toBe(2);
    expect(filteredEvents).toEqual([mockEvents[2], mockEvents[3]]);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', new Date('2024-07-01'), 'month');
    expect(filteredEvents.length).toBe(5);
    expect(filteredEvents).toEqual([
      mockEvents[2],
      mockEvents[3],
      mockEvents[4],
      mockEvents[5],
      mockEvents[6],
    ]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const filteredEvents = getFilteredEvents(mockEvents, '이벤트', new Date('2024-07-21'), 'week');
    expect(filteredEvents.length).toBe(2);
    expect(filteredEvents).toEqual([mockEvents[5], mockEvents[6]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', new Date('2024-07-21'), 'month');
    expect(filteredEvents.length).toBe(5);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, 'event', new Date('2024-07-21'), 'month');
    expect(filteredEvents.length).toBe(1);
    expect(filteredEvents).toEqual([mockEvents[4]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const filteredEvents = getFilteredEvents(edgeEvents, '', new Date('2024-10-02'), 'week');
    // 9월 30일과 10월 1일 둘다 10월 2일이 포함된 주에 있다.
    expect(filteredEvents.length).toBe(2);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const filteredEvents = getFilteredEvents([], '', new Date('2024-07-21'), 'month');
    expect(filteredEvents.length).toBe(0);
  });
});

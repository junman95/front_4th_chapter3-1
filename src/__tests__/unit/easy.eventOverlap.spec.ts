import {
  events as mockEvents,
  newOverlappingEvent,
  newNoneOverlappingEvent,
} from '../../__mocks__/data/events';
import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = '2024-07-01';
    const time = '14:30';
    expect(parseDateTime(date, time)).toEqual(new Date('2024-07-01T14:30:00'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2024-13-01';
    const time = '14:30';
    expect(parseDateTime(date, time)).toEqual(new Date('Invalid Date'));
    const date2 = '2024-07-32';
    expect(parseDateTime(date2, time)).toEqual(new Date('Invalid Date'));
    const date3 = '2024/07/01';
    expect(parseDateTime(date3, time)).toEqual(new Date('Invalid Date'));
    const date4 = '2024년07월01일';
    expect(parseDateTime(date4, time)).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = '2024-07-01';
    const time = '24:01';
    expect(parseDateTime(date, time)).toEqual(new Date('Invalid Date'));
    const time2 = '-1:01';
    expect(parseDateTime(date, time2)).toEqual(new Date('Invalid Date'));
    const time3 = '0';
    expect(parseDateTime(date, time3)).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = '';
    const time = '14:30';
    expect(parseDateTime(date, time)).toEqual(new Date('Invalid Date'));
  });

  // 추가 테스트 케이스
  it('시간 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = '2024-07-01';
    const time = '';
    expect(parseDateTime(date, time)).toEqual(new Date('Invalid Date'));
  });
  // 추가 테스트 케이스2
  it('날짜가 월까지 입력되었을 때 해당월의 01일 Date 객체로 변환한다', () => {
    const date = '2024-07';
    const time = '14:30';
    expect(parseDateTime(date, time)).toEqual(new Date('2024-07-01T14:30:00'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = mockEvents[0];
    // utc -> local로 비교해 줘야 +9시간이 더해진다. 즉, 실제 넣은 startTime과 맞춰주는 변환이 필요하다.
    expect(convertEventToDateRange(event).start.getHours()).toBe(
      Number(event.startTime.split(':')[0])
    );
    expect(convertEventToDateRange(event).start.getMinutes()).toBe(
      Number(event.startTime.split(':')[1])
    );
    expect(convertEventToDateRange(event).end.getHours()).toBe(Number(event.endTime.split(':')[0]));
    expect(convertEventToDateRange(event).end.getMinutes()).toBe(
      Number(event.endTime.split(':')[1])
    );
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = mockEvents[1];
    event.date = '24년10월10일';
    expect(convertEventToDateRange(event)).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });

    event.date = '2024-13-01';
    expect(convertEventToDateRange(event)).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });

    event.date = '2024-07-32';
    expect(convertEventToDateRange(event)).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = mockEvents[2];

    // startTime
    event.startTime = '24:01';
    expect(convertEventToDateRange(event).start).toEqual(new Date('Invalid Date'));

    event.startTime = '-1:01';
    expect(convertEventToDateRange(event).start).toEqual(new Date('Invalid Date'));

    event.startTime = '0';
    expect(convertEventToDateRange(event).start).toEqual(new Date('Invalid Date'));

    // 초기화
    event.startTime = '14:30';
    expect(convertEventToDateRange(event).start.getHours()).toBe(14);

    // endTime
    event.endTime = '24:01';
    expect(convertEventToDateRange(event).end).toEqual(new Date('Invalid Date'));

    event.endTime = '-1:01';
    expect(convertEventToDateRange(event).end).toEqual(new Date('Invalid Date'));

    event.endTime = '0';
    expect(convertEventToDateRange(event).end).toEqual(new Date('Invalid Date'));
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = mockEvents[7];
    const event2: Event = mockEvents[8];
    console.log(event1, event2);
    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = mockEvents[0];
    const event2: Event = mockEvents[1];
    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    expect(findOverlappingEvents(newOverlappingEvent, mockEvents)).toEqual([
      mockEvents[7],
      mockEvents[8],
    ]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    expect(findOverlappingEvents(newNoneOverlappingEvent, mockEvents)).toEqual([]);
  });
});

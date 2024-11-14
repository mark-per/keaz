import { Paginate, SuperPaginate, Order, GetPaginateQuery, getSortCommandForSorting, getPaginateCommands } from '../../src/common/pagination/pagination';

describe('Pagination', () => {
    describe('Paginate.create', () => {
        it('should return the last item ID as cursorID when data length equals limit', () => {
            const data = [{ id: '1' }, { id: '2' }, { id: '3' }];
            const result = Paginate.create(data, 3);
            expect(result).toEqual({ data, cursorID: '3' });
        });

        it('should return null cursorID when data length is less than limit', () => {
            const data = [{ id: '1' }, { id: '2' }];
            const result = Paginate.create(data, 3);
            expect(result).toEqual({ data, cursorID: null });
        });
    });

    describe('SuperPaginate', () => {
        it('should create an instance of SuperPaginate with the correct type', () => {
            class MockType {}
            const paginate = new SuperPaginate(MockType);
            expect(paginate).toBeInstanceOf(SuperPaginate);
            expect(paginate['type']).toBe(MockType);
        });
    });

    describe('Order Enum', () => {
        it('should have Asc and Desc values', () => {
            expect(Order.Asc).toBe('asc');
            expect(Order.Desc).toBe('desc');
        });
    });

    describe('GetPaginateQuery Class', () => {
        it('should create an instance with default values', () => {
            const query = new GetPaginateQuery();
            expect(query.search).toBeUndefined();
            expect(query.sort).toBeUndefined();
            expect(query.order).toBeUndefined();
            expect(query.cursorID).toBeUndefined();
            expect(query.limit).toBeUndefined();
        });
    });

    describe('getSortCommandForSorting', () => {
        it('should return a simple sort command for single-level keys', () => {
            const result = getSortCommandForSorting('name', 'asc');
            expect(result).toEqual({ name: 'asc' });
        });

        it('should return a nested sort command for multi-level keys', () => {
            const result = getSortCommandForSorting('user.name', 'desc');
            expect(result).toEqual({ user: { name: 'desc' } });
        });

        it('should handle deeply nested keys', () => {
            const result = getSortCommandForSorting('a.b.c', 'asc');
            expect(result).toEqual({ a: { b: { c: 'asc' } } });
        });
    });

    describe('getPaginateCommands', () => {
        it('should return empty object if limit is -1 (no pagination)', () => {
            const result = getPaginateCommands(null, null, null, -1);
            expect(result).toEqual({});
        });

        it('should return default orderBy on createdAt descending if no sort is provided', () => {
            const result = getPaginateCommands(null, null);
            expect(result).toEqual({
                orderBy: { createdAt: Order.Desc },
                take: 25,
            });
        });

        it('should apply sort and order when provided', () => {
            const result = getPaginateCommands('name', Order.Asc);
            expect(result).toEqual({
                orderBy: [{ name: Order.Asc }, { id: Order.Desc }],
                take: 25,
            });
        });

        it('should add skip and cursor if cursorID is provided', () => {
            const result = getPaginateCommands('name', Order.Asc, 'cursor123', 10);
            expect(result).toEqual({
                orderBy: [{ name: Order.Asc }, { id: Order.Desc }],
                cursor: { id: 'cursor123' },
                skip: 1,
                take: 10,
            });
        });

        it('should default to limit of 25 if no limit is provided', () => {
            const result = getPaginateCommands('name', Order.Asc);
            expect(result.take).toBe(25);
        });

        it('should respect provided limit', () => {
            const result = getPaginateCommands('name', Order.Asc, null, 5);
            expect(result.take).toBe(5);
        });

        it('should handle sort by multi-level keys', () => {
            const result = getPaginateCommands('user.name', Order.Desc);
            expect(result).toEqual({
                orderBy: [{ user: { name: Order.Desc } }, { id: Order.Desc }],
                take: 25,
            });
        });
    });
});

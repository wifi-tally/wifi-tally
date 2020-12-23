import uniqueId from './uniqueId';

test('it is good enough to generate 1000 distinct ids', () => {
    const seenIds = new Set<string>()

    for (let i=0; i<1000; i++) {
        const id = uniqueId()
        expect(seenIds).not.toContain(id)
        seenIds.add(id)
    }
})

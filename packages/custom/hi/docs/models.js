exports.models = {
    room: {
        id: 'Room',
        properties: {
            name: {
                type: 'string',
                description : 'name of room'
            },
            slug: {
                type: 'string',
                description: 'short slug of room'
            },
            description: {
                type: 'string',
                description: 'description of room (and its aim)'
            },
            isExternal: {
                type: 'boolean',
                description: 'display if the room created via external application'
            },
            members : {
                type: 'array',
                description: 'array of users ids of room\'s members'
            }
        }
    }
}
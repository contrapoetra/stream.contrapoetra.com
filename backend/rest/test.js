const UserService = require('./models/users');

async function quickTest() {
    console.log('=== Testing Users CRUD ===');

    // Test data
    const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'test_hash',
        channel_name: 'Test Channel'
    };

    try {
        // Create
        const id = await UserService.createUser(testUser);
        console.log('✓ User created with ID:', id);

        // Read
        const user = await UserService.getUserById(id);
        console.log('✓ User fetched:', user.username);

        // Update
        await UserService.updateUser(id, { username: 'updated_user' });
        console.log('✓ User updated');

        // Delete
        await UserService.deleteUser(id);
        console.log('✓ User deleted');

        console.log('=== All tests passed ===');
    } catch (error) {
        console.error('✗ Test failed:', error.message);
    }
}

quickTest();

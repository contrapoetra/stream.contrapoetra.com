const UserService = require('./models/users');

async function main() {
    try {
        // Create a user
        const newUserId = await UserService.createUser({
            username: 'johndoe',
            email: 'john@example.com',
            password_hash: 'hashed_password_123',
            channel_name: 'John Doe Channel',
            profile_picture_url: 'https://example.com/avatar.jpg'
        });
        console.log('Created user with ID:', newUserId);

        // Get user by ID
        const user = await UserService.getUserById(newUserId);
        console.log('User details:', user);

        // Update user
        const updated = await UserService.updateUser(newUserId, {
            username: 'john_updated',
            email: 'john_updated@example.com',
            channel_name: 'Updated Channel',
            profile_picture_url: 'https://example.com/new_avatar.jpg'
        });
        console.log('Updated rows:', updated);

        // Get all users
        const allUsers = await UserService.getAllUsers();
        console.log('All users:', allUsers);

        // Delete user
        const deleted = await UserService.deleteUser(newUserId);
        console.log('Deleted rows:', deleted);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();

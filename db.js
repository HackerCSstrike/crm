const db = {
    users: [
        { id: 1, username: 'admin', password: 'dizerma', role: 'owner' },
        { id: 2, username: 'master1', password: 'password', role: 'master', subscription: 'Professional' },
        { id: 3, username: 'user1', password: 'password', role: 'client', subscription: 'Base' },
    ],
    bookings: [
        { id: 1, masterId: 2, date: '2023-10-27', time: '10:00' },
        { id: 2, masterId: 2, date: '2023-10-28', time: '14:30' },
    ],
    subscriptions: {
        'Base': 1000,
        'Professional': 3000,
        'Premium': 5000,
    },
    calculateMonthlyRevenue: () => {
        return db.users.reduce((total, user) => {
            return total + (db.subscriptions[user.subscription] || 0);
        }, 0);
    }
};

module.exports = db;
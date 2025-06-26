const mongoose = require('mongoose');
const CommunityModel = require('./models/communities');
const PostModel      = require('./models/posts');
const CommentModel   = require('./models/comments');
const LinkFlairModel = require('./models/linkflairs');
const UserModel      = require('./models/user');
const bcrypt = require('bcrypt');

let userArgs = process.argv.slice(2);
if (!userArgs[0]?.startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    process.exit(1);
}

const mongoDB = userArgs[0];
mongoose.connect(mongoDB);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

function createCommunity(communityObj) {
    return new CommunityModel(communityObj).save();
}

function createLinkFlair(linkFlairObj) {
    return new LinkFlairModel(linkFlairObj).save();
}

function createUser(userObj) {
    return new UserModel(userObj).save();
}

function createComment(commentObj) {
    return new CommentModel(commentObj).save();
}

function createPost(postObj) {
    return new PostModel(postObj).save();
}

async function init() {
    await UserModel.deleteMany({});

    const linkFlair1 = { content: "rant" };
    const linkFlair2 = { content: "question" };
    const linkFlairRef1 = await createLinkFlair(linkFlair1);
    const linkFlairRef2 = await createLinkFlair(linkFlair2);

    const rawUsers = [
        { firstName: "Alex", lastName: "Taylor", email: "alex.taylor@example.com", displayName: "alex", password: "securepass1", reputation: 100, isAdmin: false },
        { firstName: "Jordan", lastName: "Lee", email: "jordan.lee@example.com", displayName: "jordan", password: "securepass2", reputation: 1000, isAdmin: true },
        { firstName: "Sam", lastName: "Green", email: "sam.green@example.com", displayName: "sam", password: "securepass3", reputation: 100, isAdmin: false },
        { firstName: "Riley", lastName: "Chen", email: "riley.chen@example.com", displayName: "riley", password: "securepass4", reputation: 100, isAdmin: false },
        { firstName: "Morgan", lastName: "Patel", email: "morgan.patel@example.com", displayName: "morgan", password: "securepass5", reputation: 100, isAdmin: false },
        { firstName: "Jamie", lastName: "Nguyen", email: "jamie.nguyen@example.com", displayName: "jamie", password: "securepass6", reputation: 100, isAdmin: false },
        { firstName: "Casey", lastName: "Wright", email: "casey.wright@example.com", displayName: "casey", password: "securepass7", reputation: 100, isAdmin: false },
        { firstName: "Drew", lastName: "Martinez", email: "drew.martinez@example.com", displayName: "drew", password: "securepass8", reputation: 100, isAdmin: false },
        { firstName: "Terry", lastName: "Morgan", email: "terry.morgan@example.com", displayName: "terry", password: "securepass9", reputation: 100, isAdmin: false },
        { firstName: "Kris", lastName: "Ali", email: "kris.ali@example.com", displayName: "kris", password: "securepass10", reputation: 100, isAdmin: false },
        { firstName: "Taylor", lastName: "Brooks", email: "taylor.brooks@example.com", displayName: "taylor", password: "securepass11", reputation: 100, isAdmin: false }
    ];

    const saltRounds = 10;
    const userPromises = rawUsers.map(async u => {
        const hash = await bcrypt.hash(u.password, saltRounds);
        return new UserModel({ ...u, password: hash }).save();
    });
    const userRefs = await Promise.all(userPromises);

    const comment1 = { content: "Anyone else struggling with async JavaScript?", commentedBy: userRefs[8].displayName, commentedDate: new Date(), vote: 4, upvotedBy: [userRefs[4]._id, userRefs[5]._id], downvotedBy: [userRefs[1]._id] };
    const comment2 = { content: "React is cool, but hooks are confusing.", commentedBy: userRefs[1].displayName, commentedDate: new Date(), vote: 3, upvotedBy: [userRefs[0]._id, userRefs[2]._id], downvotedBy: [] };

    const commentRef1 = await createComment(comment1);
    const commentRef2 = await createComment(comment2);

    const post1 = {
        title: "Need help with frontend layout",
        content: "My flexbox isn't working as expected. Any tips?",
        linkFlairID: linkFlairRef2,
        postedBy: userRefs[2].displayName,
        postedDate: new Date(),
        commentIDs: [commentRef1],
        views: 45,
        vote: 3,
        upvotedBy: [userRefs[0]._id],
        downvotedBy: []
    };

    const post2 = {
        title: "JavaScript fatigue is real",
        content: "Every week there's a new framework...",
        linkFlairID: linkFlairRef1,
        postedBy: userRefs[3].displayName,
        postedDate: new Date(),
        commentIDs: [commentRef2],
        views: 33,
        vote: 2,
        upvotedBy: [userRefs[1]._id, userRefs[4]._id],
        downvotedBy: []
    };

    const postRef1 = await createPost(post1);
    const postRef2 = await createPost(post2);

    const comm1 = {
        name: "Frontend Dev",
        description: "Talk about CSS, HTML, JavaScript, and all things frontend.",
        postIDs: [postRef1],
        startDate: new Date(),
        members: rawUsers.map(u => u.email),
        creator: userRefs[2].displayName
    };

    const comm2 = {
        name: "Tech Rants",
        description: "Vent about your developer struggles and joys.",
        postIDs: [postRef2],
        startDate: new Date(),
        members: [userRefs[1].email, userRefs[3].email],
        creator: userRefs[3].displayName
    };

    await createCommunity(comm1);
    await createCommunity(comm2);

    db.close();
    console.log('done');
}

init().catch(err => { console.error('ERROR:', err); db.close(); });

console.log('processing...');

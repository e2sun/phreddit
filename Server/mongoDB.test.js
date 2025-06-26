// demonstrate that when a post is deleted, it and all of its comments are removed from the database
// your test must demonstrate that when a post is deleted, it and all of its comments are removed from the database

// process
//   build a list of the postID and the commentIDs for each comment on the post
//   run your deletion operation
//   the expect clause should be passed the result of querying by the postID and each of the commentIDs in a loop
//   the assertion should be that the query result is empty (or that its length is 0)


const mongoose = require('mongoose');
const axios = require('axios');

describe('all comments from a deleted post are also deleted', () => {
    let db;
    let mockPost;
    let mockComment;

    beforeAll(async () => {
        await mongoose.connect("mongodb://127.0.0.1:27017/jest");
        db = mongoose.connection;
        const mockPostSchema = mongoose.Schema({
            commentIDs: { type: [{type: mongoose.Schema.Types.ObjectId, ref: 'mockCommentSchema'}], default: [] },
        });

        const mockCommentSchema = mongoose.Schema({
            commentIDs: { type: [{type: mongoose.Schema.Types.ObjectId, ref: 'mockCommentSchema'}], default: [] },
        });

        mockPost = mongoose.model('MockPost', mockPostSchema, 'posts');
        mockComment = mongoose.model('MockComment', mockCommentSchema, 'comments');
    });

    afterAll(async() => {
        await db.dropDatabase()
        await db.close();
    })

    // using our code from phreddit, with some slight adjustments for proper async functionality
    const totalComments = async (commentArray = []) => {
        let commentCount = 0;

        const countAll = async (commentArray) => {
            for(const commentID of commentArray) {
                commentCount++;
                const currentComment = await mockComment.findById(commentID);
                
                if (currentComment?.commentIDs && Array.isArray(currentComment.commentIDs)) {
                    await countAll(currentComment.commentIDs);
                }
            }
        };

        await countAll(commentArray);
        return commentCount;
    }

    // copying our delete post functionality from my server (since this is what we want to test)
    async function deleteCommentsRecursive(commentIds){
      for (const commentID of commentIds){
        const comment = await mockComment.findById(commentID);
        if (!comment) continue;
        if (comment.commentIDs && comment.commentIDs.length){
          await deleteCommentsRecursive(comment.commentIDs);
        }
        await mockComment.findByIdAndDelete(commentID);
      }
    }

    const deletePost = async(postID) => {
        const toDelete = await mockPost.findById(postID);
        if (toDelete.commentIDs && toDelete.commentIDs.length){
            await deleteCommentsRecursive(toDelete.commentIDs);
        }

        // delete all comments 
        await mockPost.findByIdAndDelete(postID);
        
    }

    test('all comments should be deleted', async () => {
        // making and saving comment reply replies
        let mRR1 = new mockComment();
        let mRR2 = new mockComment();
        let mRR3 = new mockComment();

        let sMRR1 = await mRR1.save();
        let sMRR2 = await mRR2.save();
        let sMRR3 = await mRR3.save();

        // making, populating, and saving comment replies
        let mR1 = new mockComment();
        let mR2 = new mockComment();
        let mR3 = new mockComment();

        mR1.commentIDs.push(sMRR1._id);
        mR3.commentIDs.push(sMRR2._id, sMRR3._id);

        let sMR1 = await mR1.save();
        let sMR2 = await mR2.save();
        let sMR3 = await mR3.save();

        // making, populating, and saving comments
        let mC1 = new mockComment();
        let mC2 = new mockComment();
        let mC3 = new mockComment();

        mC1.commentIDs.push(sMR1._id, sMR2._id);
        mC2.commentIDs.push(sMR3._id);

        let sMC1 = await mC1.save();
        let sMC2 = await mC2.save();
        let sMC3 = await mC3.save();

        // making, populating, and saving post
        let mP = new mockPost();

        mP.commentIDs.push(sMC1._id, sMC2._id, sMC3._id);

        let sMP = await mP.save();

        let insertedPost = await mockPost.findById(sMP._id);

        // make sure that the post was actually deleted
        await deletePost(insertedPost);
        const deletedPost = await mockPost.findById(insertedPost._id);
        expect(deletedPost).toBeNull();

        // make sure all comments are deleted
        const allComments = await mockComment.find();
        expect(allComments).toHaveLength(0);
    })
});
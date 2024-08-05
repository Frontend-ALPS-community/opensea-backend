const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 글 작성자의 ID
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', postSchema);


app.post('/posts', authenticateToken, async (req, res) => {
    try {
      const { title, content } = req.body;
      
      // 요청한 사용자의 ID를 JWT에서 가져와서 author로 설정
      const post = new Post({
        title,
        content,
        author: req.user.userId, // JWT에서 추출한 사용자 ID
      });
  
      await post.save(); // 글을 데이터베이스에 저장
  
      res.status(201).json({ message: 'Post created successfully', post });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
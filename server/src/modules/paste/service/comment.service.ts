import { Comment, Paste, User } from '@/db/models';
import { AppError } from '@/middlewares/error-handler';

type CommentWithUser = Comment & { user?: { username: string; avatar: string | null } };
type CommentWithPaste = Comment & { paste?: { id: string; name: string; link_endpoint: string } };

export const createCommentService = async (content: string, pasteId: string, username: string) => {
  const [paste, user] = await Promise.all([
    Paste.findByPk(pasteId),
    User.findOne({ where: { username } }),
  ]);

  if (!paste) throw new AppError(404, 'Paste not found');
  if (!user) throw new AppError(404, 'User not found');

  const comment = await Comment.create({ content, paste_id: pasteId, user_id: user.id });
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    author: user.username,
    avatar: user.avatar ?? null,
  };
};

export const getCommentsService = async (pasteId: string) => {
  const comments = await Comment.findAll({
    where: { paste_id: pasteId },
    include: [{ model: User, as: 'user', attributes: ['username', 'avatar'] }],
    order: [['createdAt', 'DESC']],
  });

  return comments.map((c) => {
    const casted = c as CommentWithUser;
    return {
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      author: casted.user?.username ?? 'Anonymous',
      avatar: casted.user?.avatar ?? null,
    };
  });
};

export const getUserCommentsService = async (username: string) => {
  const user = await User.findOne({ where: { username } });
  if (!user) throw new AppError(404, 'User not found');

  const comments = await Comment.findAll({
    where: { user_id: user.id },
    include: [{ model: Paste, as: 'paste', attributes: ['id', 'name', 'link_endpoint'] }],
    order: [['createdAt', 'DESC']],
  });

  return comments.map((c) => {
    const paste = (c as CommentWithPaste).paste;
    return {
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      pasteId: paste?.id ?? null,
      pasteTitle: paste?.name ?? 'Untitled',
      pasteLink: paste?.link_endpoint ?? null,
    };
  });
};

export const deleteCommentService = async (commentId: string, requestingUserId: string) => {
  const comment = await Comment.findByPk(commentId);
  if (!comment) throw new AppError(404, 'Comment not found');
  if (comment.user_id !== requestingUserId) throw new AppError(403, 'Forbidden');
  await comment.destroy();
  return { message: 'Comment was deleted successfully!' };
};

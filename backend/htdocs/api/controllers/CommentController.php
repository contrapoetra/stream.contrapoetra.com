<?php
class CommentController {
    private $db;
    private $comment;

    public function __construct($db) {
        $this->db = $db;
        $this->comment = new Comment($db);
    }

    public function create($data) {
        if(!empty($data->comment_text) && !empty($data->user_id) && !empty($data->video_id)) {
            $this->comment->comment_text = $data->comment_text;
            $this->comment->user_id = $data->user_id;
            $this->comment->video_id = $data->video_id;
            $this->comment->parent_comment_id = $data->parent_comment_id ?? null;

            if($this->comment->create()) {
                http_response_code(201);
                return json_encode(array(
                    "message" => "Comment added successfully.",
                    "comment_id" => $this->comment->comment_id
                ));
            } else {
                http_response_code(503);
                return json_encode(array("message" => "Unable to add comment."));
            }
        } else {
            http_response_code(400);
            return json_encode(array("message" => "comment_text, user_id, and video_id are required."));
        }
    }

    public function getByVideo($video_id) {
        $this->comment->video_id = $video_id;
        $stmt = $this->comment->readByVideo();

        $comments_arr = array();
        $comments_arr["comments"] = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($comments_arr["comments"], $row);
        }

        http_response_code(200);
        return json_encode($comments_arr);
    }

    public function likeComment($comment_id) {
        $query = "UPDATE comments
                SET like_count = like_count + 1
                WHERE comment_id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $comment_id);

        if($stmt->execute()) {
            http_response_code(200);
            return json_encode(array("message" => "Comment liked."));
        } else {
            http_response_code(503);
            return json_encode(array("message" => "Unable to like comment."));
        }
    }
}
?>

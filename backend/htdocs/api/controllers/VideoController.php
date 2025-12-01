<?php
class VideoController {
    private $db;
    private $video;

    public function __construct($db) {
        $this->db = $db;
        $this->video = new Video($db);
    }

    public function upload($data, $files) {
        if(!empty($data->title) && !empty($data->user_id)) {
            // Handle file upload
            if(isset($files['video_file'])) {
                $upload_dir = "../uploads/videos/";
                if(!is_dir($upload_dir)) {
                    mkdir($upload_dir, 0777, true);
                }

                $file_name = time() . '_' . basename($files['video_file']['name']);
                $file_path = $upload_dir . $file_name;

                if(move_uploaded_file($files['video_file']['tmp_name'], $file_path)) {
                    // Handle thumbnail if provided
                    $thumbnail_url = null;
                    if(isset($files['thumbnail'])) {
                        $thumb_dir = "../uploads/thumbnails/";
                        if(!is_dir($thumb_dir)) {
                            mkdir($thumb_dir, 0777, true);
                        }
                        $thumb_name = time() . '_' . basename($files['thumbnail']['name']);
                        $thumb_path = $thumb_dir . $thumb_name;
                        if(move_uploaded_file($files['thumbnail']['tmp_name'], $thumb_path)) {
                            $thumbnail_url = "uploads/thumbnails/" . $thumb_name;
                        }
                    }

                    $this->video->title = $data->title;
                    $this->video->description = $data->description ?? null;
                    $this->video->file_url = "uploads/videos/" . $file_name;
                    $this->video->thumbnail_url = $thumbnail_url;
                    $this->video->user_id = $data->user_id;
                    $this->video->duration_seconds = $data->duration_seconds ?? null;
                    $this->video->file_size = $files['video_file']['size'];
                    $this->video->mime_type = $files['video_file']['type'];
                    $this->video->status = 'processing';

                    if($this->video->create()) {
                        http_response_code(201);
                        return json_encode(array(
                            "message" => "Video uploaded successfully.",
                            "video_id" => $this->video->video_id
                        ));
                    } else {
                        unlink($file_path); // Clean up file if DB insert fails
                        if($thumbnail_url) unlink("../" . $thumbnail_url);
                        http_response_code(503);
                        return json_encode(array("message" => "Unable to upload video."));
                    }
                } else {
                    http_response_code(400);
                    return json_encode(array("message" => "File upload failed."));
                }
            } else {
                http_response_code(400);
                return json_encode(array("message" => "Video file is required."));
            }
        } else {
            http_response_code(400);
            return json_encode(array("message" => "Title and user_id are required."));
        }
    }

    public function getVideo($video_id) {
        $this->video->video_id = $video_id;
        $stmt = $this->video->read();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            // Increment view count
            $this->video->updateViewCount();

            http_response_code(200);
            return json_encode($row);
        } else {
            http_response_code(404);
            return json_encode(array("message" => "Video not found."));
        }
    }

    public function getVideos($page = 1, $per_page = 10) {
        $from_record_num = ($page - 1) * $per_page;

        $stmt = $this->video->readAll($from_record_num, $per_page);
        $num = $stmt->rowCount();

        $videos_arr = array();
        $videos_arr["videos"] = array();
        $videos_arr["paging"] = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($videos_arr["videos"], $row);
        }

        $total_rows = $this->video->countAll();
        $videos_arr["paging"] = array(
            "page" => $page,
            "per_page" => $per_page,
            "total_rows" => $total_rows,
            "total_pages" => ceil($total_rows / $per_page)
        );

        http_response_code(200);
        return json_encode($videos_arr);
    }
}
?>

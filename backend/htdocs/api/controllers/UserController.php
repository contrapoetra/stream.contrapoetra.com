<?php
class UserController {
    private $db;
    private $user;

    public function __construct($db) {
        $this->db = $db;
        $this->user = new User($db);
    }

    public function register($data) {
        if(!empty($data->email) && !empty($data->password) && !empty($data->username)) {
            $this->user->email = $data->email;
            $this->user->username = $data->username;
            $this->user->password_hash = $data->password;
            $this->user->channel_name = $data->channel_name ?? $data->username;
            $this->user->profile_picture_url = $data->profile_picture_url ?? null;

            if($this->user->emailExists()) {
                http_response_code(409);
                return json_encode(array("message" => "Email already exists."));
            }

            if($this->user->create()) {
                http_response_code(201);
                return json_encode(array(
                    "message" => "User created successfully.",
                    "user_id" => $this->user->user_id,
                    "username" => $this->user->username
                ));
            } else {
                http_response_code(503);
                return json_encode(array("message" => "Unable to create user."));
            }
        } else {
            http_response_code(400);
            return json_encode(array("message" => "Unable to create user. Data is incomplete."));
        }
    }

    public function login($data) {
        if(!empty($data->email) && !empty($data->password)) {
            $this->user->email = $data->email;
            $password = $data->password;

            if($this->user->emailExists() && password_verify($password, $this->user->password_hash)) {
                http_response_code(200);
                return json_encode(array(
                    "message" => "Login successful.",
                    "user_id" => $this->user->user_id,
                    "username" => $this->user->username,
                    "channel_name" => $this->user->channel_name
                ));
            } else {
                http_response_code(401);
                return json_encode(array("message" => "Login failed."));
            }
        } else {
            http_response_code(400);
            return json_encode(array("message" => "Email and password are required."));
        }
    }

    public function getProfile($user_id) {
        $this->user->user_id = $user_id;
        $stmt = $this->user->read();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            http_response_code(200);
            return json_encode($row);
        } else {
            http_response_code(404);
            return json_encode(array("message" => "User not found."));
        }
    }
}
?>

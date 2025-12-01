<?php
class SubscriptionController {
    private $db;
    private $subscription;

    public function __construct($db) {
        $this->db = $db;
        $this->subscription = new Subscription($db);
    }

    public function subscribe($data) {
        if(!empty($data->subscriber_id) && !empty($data->channel_id)) {
            $this->subscription->subscriber_id = $data->subscriber_id;
            $this->subscription->channel_id = $data->channel_id;
            $this->subscription->notification_preferences = $data->notification_preferences ?? 1;

            if($this->subscription->create()) {
                http_response_code(201);
                return json_encode(array(
                    "message" => "Subscribed successfully.",
                    "subscription_id" => $this->subscription->subscription_id
                ));
            } else {
                http_response_code(409);
                return json_encode(array("message" => "Already subscribed to this channel."));
            }
        } else {
            http_response_code(400);
            return json_encode(array("message" => "subscriber_id and channel_id are required."));
        }
    }

    public function unsubscribe($data) {
        if(!empty($data->subscriber_id) && !empty($data->channel_id)) {
            $this->subscription->subscriber_id = $data->subscriber_id;
            $this->subscription->channel_id = $data->channel_id;

            if($this->subscription->delete()) {
                http_response_code(200);
                return json_encode(array("message" => "Unsubscribed successfully."));
            } else {
                http_response_code(404);
                return json_encode(array("message" => "Subscription not found."));
            }
        } else {
            http_response_code(400);
            return json_encode(array("message" => "subscriber_id and channel_id are required."));
        }
    }

    public function checkSubscription($subscriber_id, $channel_id) {
        $this->subscription->subscriber_id = $subscriber_id;
        $this->subscription->channel_id = $channel_id;

        $isSubscribed = $this->subscription->isSubscribed();

        http_response_code(200);
        return json_encode(array(
            "subscribed" => $isSubscribed
        ));
    }

    public function getSubscriberCount($channel_id) {
        $count = $this->subscription->getSubscriberCount($channel_id);

        http_response_code(200);
        return json_encode(array(
            "channel_id" => $channel_id,
            "subscriber_count" => $count
        ));
    }

    public function getSubscriptions($subscriber_id) {
        $stmt = $this->subscription->getSubscriptions($subscriber_id);

        $subscriptions_arr = array();
        $subscriptions_arr["subscriptions"] = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($subscriptions_arr["subscriptions"], $row);
        }

        http_response_code(200);
        return json_encode($subscriptions_arr);
    }

    public function getSubscribers($channel_id) {
        $stmt = $this->subscription->getSubscribers($channel_id);

        $subscribers_arr = array();
        $subscribers_arr["subscribers"] = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($subscribers_arr["subscribers"], $row);
        }

        http_response_code(200);
        return json_encode($subscribers_arr);
    }
}
?>

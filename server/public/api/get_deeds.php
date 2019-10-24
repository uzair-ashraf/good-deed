<?php
if (!defined('INTERNAL')) {
  exit('Direct access is not allowed');
}
$cat_id = intval($_GET['catid']);
$user_id = intval($_GET['id']);
$query = "SELECT R.`request_id`, R.`category_id`, R.`headline`, R.`summary`, R.`request_user_id`, R.`completed`, U.`username`, U.`zipcode`, U.`image_url`
FROM `requests` AS R
JOIN `users` AS U
ON U.`user_id` = R.`request_user_id`
WHERE  R.`completed` != 1 && R.`request_user_id` != {$user_id} && R.`category_id` = {$cat_id}";
$result = mysqli_query($conn, $query);
if (!$result) {
  throw new Exception('Error'.mysqli_error($conn));
}
$deedList = [];
while($row = mysqli_fetch_assoc($result)) {
  array_push($deedList, $row);
}

$deedList = json_encode($deedList);

print_r($deedList);

?>
<?php
require_once('functions.php');
set_exception_handler('commit_error_handler');
require_once('../../db_connection.php');

$userDeleteData = getBodyData();
$requestId = intval($userDeleteData['request_id']);

$query = "DELETE FROM `requests` WHERE `request_id` = $requestId";

$result = mysqli_query($conn, $query);
if (!$result) {
  throw new Exception('Error canceling the commit' . mysqli_error($conn));
}

$response = mysqli_affected_rows($conn);

print_r(json_encode($response));
?>

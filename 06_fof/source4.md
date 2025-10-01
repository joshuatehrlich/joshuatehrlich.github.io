Usage notes
The setInterval() function is commonly used to set a delay for functions that are executed again and again, such as animations. You can cancel the interval using clearInterval().

If you wish to have your function called once after the specified delay, use setTimeout().

Delay restrictions
It's possible for intervals to be nested; that is, the callback for setInterval() can in turn call setInterval() to start another interval running, even though the first one is still going. To mitigate the potential impact this can have on performance, once intervals are nested beyond five levels deep, the browser will automatically enforce a 4 ms minimum value for the interval. Attempts to specify a value less than 4 ms in deeply-nested calls to setInterval() will be pinned to 4 ms.

Browsers may enforce even more stringent minimum values for the interval under some circumstances, although these should not be common. Note also that the actual amount of time that elapses between calls to the callback may be longer than the given delay; see Reasons for delays longer than specified for examples.

Ensure that execution duration is shorter than interval frequency
If there is a possibility that your logic could take longer to execute than the interval time, it is recommended that you recursively call a named function using setTimeout(). For example, if using setInterval() to poll a remote server every 5 seconds, network latency, an unresponsive server, and a host of other issues could prevent the request from completing in its allotted time. As such, you may find yourself with queued up XHR requests that won't necessarily return in order.
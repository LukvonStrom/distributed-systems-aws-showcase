package database;


import com.amazonaws.AmazonClientException;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.DynamodbEvent;
import com.amazonaws.services.sns.AmazonSNS;
import com.amazonaws.services.sns.AmazonSNSClientBuilder;
import com.amazonaws.services.sns.model.PublishRequest;
import com.amazonaws.services.sns.model.PublishResult;
import com.google.gson.Gson;

public class DynamoDBHandler implements
        RequestHandler<DynamodbEvent, String> {

    final AmazonSNS snsClient = AmazonSNSClientBuilder.defaultClient();
    Gson gson = new Gson();
    final String topicArn = /*System.getenv("TOPIC_ARN") */"arn:aws:sns:eu-central-1:386772503388:sns_test";


    public String handleRequest(DynamodbEvent dynamodbEvent, Context context) {
            for (DynamodbEvent.DynamodbStreamRecord record : dynamodbEvent.getRecords()) {

                String snsPayload = gson.toJson(record.getDynamodb());

                final PublishResult publishResponse = snsClient.publish(new PublishRequest(topicArn, snsPayload));
            }


        return "Sent " + dynamodbEvent.getRecords().size() + " to Amazon SNS.";
    }
}


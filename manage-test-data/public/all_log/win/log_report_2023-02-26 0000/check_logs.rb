require 'colorize'
require "nokogiri"
require "restclient"
def display_help
    puts "Usage: check_logs.rb [option]"
    puts "Option:"
    puts "\t--help : display this dialog"
    puts "\t--check-invalid : scan for error WAAPI_ERROR_INVALID_CREDENTIALS"
    puts "\t--check-installation : scan for error WA_VMOD_ERROR_INSTALLATION_FAILED"
    puts "\t--check-feed : scan for check feed error"
end

# Get list of log files in the log dir
# This function only works on local folder. Will enhance so that it can work with download server shared folder
def get_list_file dir
    log_dir = Dir.entries(dir)
    file_list = []
    log_dir.each {
        |file_name|
        file_list.append("#{dir}/#{file_name}") if file_name.include? "json.log"
    }
    file_list
end

# compare two version and return the result
# -1 : ver1 < ver2; 0: ver1 = ver2; 1: ver1 > ver2
def compare_version ver1, ver2
    ver1_array = ver1.split(".")
    ver2_array = ver2.split(".")
    
    if ver1_array.count() < ver2_array.count then puts "WARNING: #{@current_log} \nWARNING: version detected and version in feed is mismatched".yellow end 	

    if ver1_array.count() < ver2_array.count then ver1_array.append("0") end
    if ver1_array.count() > ver2_array.count then ver2_array.append("0") end

    for i in (0..ver1_array.count()-1) do
        case
            when ver1_array[i].to_i < ver2_array[i].to_i then return -1
            when ver1_array[i].to_i > ver2_array[i].to_i then return 1
            when ver1_array[i].to_i == ver2_array[i].to_i then next
        end
    end
    return 0
end

def check_feed_error log
    # parse the two version, one from installFromFiles and one from getProductPatchLevel
    # if the two version is not equal. It is having a problem
    log_content = File.readlines(log, :encoding => 'ISO-8859-1').to_s

    version_install = log_content.match(/\\\"version\\\" : \\\"(.*?)\\\"/)
    version_feed = log_content.match(/\\"feed_id\\\" : \d+,\\n\", \".*?\\\"version\\\" : \\\"(.*?)\\\"/)
    if version_install.nil? && version_feed.nil? then return 0 end
    result = compare_version version_install[1], version_feed[1]
    return result
end

def output_result result
    result.each {
        |it|
        puts "DETECTED FAILD:".red
        puts "\tLog name: #{it.values[0]["name"]}"
	  puts "\tPath: #{it.keys[0]}"
        puts "\tError: #{it.values[0]["errors"]}"
    }
end

# Function that read all the files and search for input error
def search_error error, dir
    puts "CHECKING ERROR #{error}, PLEASE WAIT..."
    puts "\tRed: the log contains error"
    puts "\tYellow: warning and can be ignore"

    result_out = []

    # Read each file in the file logs
    # If the content includes error pattern, returns the log file's name
    file_list = get_list_file dir
    file_list.each {
        |log|
        @current_log = File.expand_path(log)

        is_failed = false
        er_detected = []
        error.each {
            |code|
            case
                when code == "FEED_ERROR"
                    if check_feed_error(log) != 0
                        is_failed = true
                        er_detected.append("check feed")
                    end
                when code == "WA_VMOD_ERROR_INSTALLATION_FAILED"
                    if File.readlines(log, :encoding => 'ISO-8859-1').grep(/#{code}/).any?
                        is_failed = true
                        er_detected.append("installation")
                    end

                when code == "WAAPI_ERROR_INVALID_CREDENTIALS"
                    if File.readlines(log, :encoding => 'ISO-8859-1').grep(/#{code}/).any?
                        is_failed = true
                        er_detected.append("check credential")
                    end

            end
        }
        result_out.append({"#{File.expand_path(log)}" => { "errors" => er_detected, "name" => "#{log}"}}) if is_failed == true
    }

    output_result(result_out)
    puts "DONE!"
end

def check_all dir
    search_error ["WAAPI_ERROR_INVALID_CREDENTIALS", "WA_VMOD_ERROR_INSTALLATION_FAILED", "FEED_ERROR"], dir
end

ARGV.each_index { |index|
  case
    when ARGV[index] =~ /--help/i then display_help
    when ARGV[index] =~ /--check-invalid/i then search_error ["WAAPI_ERROR_INVALID_CREDENTIALS"], "."
    when ARGV[index] =~ /--check-installation/i then search_error ["WA_VMOD_ERROR_INSTALLATION_FAILED"], "."
    when ARGV[index] =~ /--check-feed/i then search_error ["FEED_ERROR"], "."
    when ARGV[index] =~ /--check-all/i then check_all "."
  end
}
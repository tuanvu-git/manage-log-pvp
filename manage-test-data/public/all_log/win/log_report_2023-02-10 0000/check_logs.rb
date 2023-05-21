def display_help
    puts "Usage: check_logs.rb [option]"
    puts "Option:"
    puts "\t--help : display this dialog"
    puts "\t--check-invalid : scan for error WAAPI_ERROR_INVALID_CREDENTIALS"
    puts "\t--check-installation : scan for error WA_VMOD_ERROR_INSTALLATION_FAILED"
end

# get list of log files in the log dir
def get_list_file dir
    log_dir = Dir.entries(dir)
    file_list = []
    log_dir.each {
        |file_name|
        file_list.append("#{dir}/#{file_name}") if file_name.include? "json.log"
    }
    file_list
end

# function that read all the files and search for input error
def search_error error, dir
    puts "CHECKING ERROR #{error}, PLEASE WAIT..."

    # read each file in the file logs
    # if the content includes error pattern, returns the log file's name
    file_list = get_list_file dir
    file_list.each {
        |log|
        if File.readlines(log, :encoding => 'ISO-8859-1').grep(/#{error}/).any?
            puts log
        end
    }

    puts "DONE!"
end

ARGV.each_index { |index|
  case
    when ARGV[index] =~ /--help/i then display_help
    when ARGV[index] =~ /--check-invalid/i then search_error "WAAPI_ERROR_INVALID_CREDENTIALS", "."
    when ARGV[index] =~ /--check-installation/i then search_error "WA_VMOD_ERROR_INSTALLATION_FAILED", "."
  end
}